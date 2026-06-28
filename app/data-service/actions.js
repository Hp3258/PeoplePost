"use server";
import { redirect } from "next/navigation";
import { getServerSupabaseClient } from "./supabaseServer";
import { revalidatePath } from "next/cache";
import { getServerSupabaseClientReadyOnly } from "./supabaseReadOnly";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function signUpAction(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const passwordConfirm = formData.get("passwordConfirm");

  const governmentId = formData?.get("governmentId");
  const name = formData.get("name");
  const role = governmentId ? "official" : "citizen";

  if (password !== passwordConfirm) return { error: "Passwords do not match." };
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    console.log("Supabase signUp error:", error);
    return { error: error.message };
  }

  // Check if user already exists (Supabase returns a user with empty identities
  // when email is already registered, instead of throwing an error)
  if (data?.user?.identities?.length === 0) {
    return { error: "An account with this email already exists. Please log in instead." };
  }
  
  const userId = data?.user?.id;

  if (!userId) {
    return { error: "Sign up failed. Please try again." };
  }

  if (role === "citizen") {
    const { error: insertError } = await supabase
      .from("users")
      .insert({ id: userId, name, email, role });
    if (insertError) {
      console.log("Insert error (citizen):", insertError);
      return { error: insertError.message };
    }
    revalidatePath("/");
    redirect("/");
  } else {
    const { error: insertError } = await supabase
      .from("users")
      .insert({ id: userId, name, email, role, governmentId });
    if (insertError) {
      console.log("Insert error (official):", insertError);
      return { error: insertError.message };
    }
    revalidatePath("/");
    redirect("/");
  }
}

export async function signout() {
  const supabase = await getServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log(error);
  }

  revalidatePath("/");
  redirect("/");
}

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.log("Login error:", error);
    return { error: error.message || "Invalid login credentials." };
  }

  revalidatePath("/");
  redirect("/");
}

export async function getCurrentUserData() {
  const supabase = await getServerSupabaseClientReadyOnly();
  const data = await supabase.auth.getUser();
  const user = data?.data?.user;
  const email = user?.email;
  const user1 = await supabase.from("users").select("id").eq("email", email);
  const id = user1?.data[0]?.id;
  const data1 = await supabase.from("reports").select("*").eq("userId", id);
  return { ...data1, userId: id };
}
export async function getcurrentOfficalData() {
  const supabase = await getServerSupabaseClientReadyOnly();
  const data = await supabase.auth.getUser();
  const user = data?.data?.user;
  const email = user?.email;
  const user1 = await supabase
    .from("users")
    .select("name,governmentId")
    .eq("email", email);

  return user1?.data?.[0];
}
export async function getId() {
  const supabase = await getServerSupabaseClientReadyOnly();
  const data = await supabase.auth.getUser();
  const user = data?.data?.user;
  const email = user?.email;
  const person = await supabase.from("users").select("id").eq("email", email);
  const data1 = person?.data;
  const id = data1?.[0]?.id;
  return id;
}

export async function getReports() {
  const supabase = await getServerSupabaseClientReadyOnly();
  // Fetch only the 5 most recent reports, ordered by creation date descending
  const reports = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Handle null or error cases
  if (!reports.data || reports.error) {
    console.log("Error fetching reports:", reports.error);
    return [];
  }

  const newReports = reports.data.map((item) => {
    const { created_at: time, address: location, title, id, status } = item;
    return { time, location, title, id, status };
  });
  return newReports;
}


export async function updateReportStatus(id, newStatus) {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("reports")
    .update({ status: newStatus })
    .eq("id", id)
    .select("*, users(email, name)");
    
  if (error) {
    console.log("Error updating report status:", error);
    return { error: error.message };
  }
  
  const report = data?.[0];
  const citizenEmail = report?.users?.email;
  const citizenName = report?.users?.name || "Citizen";
  const reportTitle = report?.title || "Your report";

  // Send email for both IN_PROCESS and RESOLVED status changes
  const shouldNotify = 
    (newStatus === "RESOLVED" || newStatus === "IN_PROCESS") &&
    citizenEmail &&
    process.env.RESEND_API_KEY;

  if (shouldNotify) {
    const emailConfig = {
      RESOLVED: {
        subject: "✅ Your issue has been resolved! — PeoplePost",
        headerColor: "#16a34a",
        headerBg: "#dcfce7",
        emoji: "✅",
        headline: "Great news — your issue is resolved!",
        bodyText: `The local authorities have reviewed and <strong>resolved</strong> your report. The issue has been addressed.`,
        footerText: "Thank you for helping improve your community. Your report made a difference!",
        badgeColor: "#16a34a",
        badgeBg: "#dcfce7",
        badgeText: "RESOLVED",
      },
      IN_PROCESS: {
        subject: "🔄 Your issue is now being processed — PeoplePost",
        headerColor: "#d97706",
        headerBg: "#fef3c7",
        emoji: "🔄",
        headline: "Your report is being worked on!",
        bodyText: `The local authorities have picked up your report and are currently <strong>processing it</strong>. Work is underway.`,
        footerText: "We'll notify you again once your issue is fully resolved. Thank you for your patience!",
        badgeColor: "#d97706",
        badgeBg: "#fef3c7",
        badgeText: "IN PROCESS",
      },
    };

    const cfg = emailConfig[newStatus];

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);max-width:600px;width:100%;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:${cfg.headerColor};padding:28px 32px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                        PeoplePost
                      </h1>
                      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                        Civic Issue Reporting Platform
                      </p>
                    </td>
                  </tr>

                  <!-- Status Badge -->
                  <tr>
                    <td style="padding:28px 32px 0;text-align:center;">
                      <span style="display:inline-block;background:${cfg.badgeBg};color:${cfg.badgeColor};font-size:13px;font-weight:700;letter-spacing:1px;padding:6px 18px;border-radius:999px;border:1.5px solid ${cfg.badgeColor};">
                        ${cfg.badgeText}
                      </span>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:20px 32px 28px;">
                      <h2 style="margin:0 0 8px;font-size:20px;color:#111827;font-weight:700;">
                        ${cfg.emoji} ${cfg.headline}
                      </h2>
                      <p style="margin:0 0 16px;color:#6b7280;font-size:15px;">
                        Hi ${citizenName},
                      </p>
                      <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
                        ${cfg.bodyText}
                      </p>

                      <!-- Report Card -->
                      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-left:4px solid ${cfg.headerColor};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                        <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                          Your Report
                        </p>
                        <p style="margin:0;font-size:16px;font-weight:600;color:#111827;">
                          ${reportTitle}
                        </p>
                      </div>

                      <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                        ${cfg.footerText}
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#9ca3af;">
                        You received this email because you submitted a report on PeoplePost.<br/>
                        © ${new Date().getFullYear()} PeoplePost. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: "PeoplePost <onboarding@resend.dev>",
        to: [citizenEmail],
        subject: cfg.subject,
        html,
      });
      console.log(`[PeoplePost] Status email (${newStatus}) sent to ${citizenEmail}`);
    } catch (emailError) {
      console.log("Error sending status email:", emailError);
    }
  }
  
  revalidatePath("/");
  return { success: true };
}


export async function toggleUpvote(reportId) {
  const supabase = await getServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to upvote." };

  // Check if upvote exists
  const { data: existingVote } = await supabase
    .from("upvotes")
    .select("id")
    .eq("report_id", reportId)
    .eq("user_id", user.id)
    .single();

  if (existingVote) {
    // Remove upvote
    const { error } = await supabase
      .from("upvotes")
      .delete()
      .eq("id", existingVote.id);
    if (error) return { error: error.message };
  } else {
    // Add upvote
    const { error } = await supabase
      .from("upvotes")
      .insert({ report_id: reportId, user_id: user.id });
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function reassignDepartment(reportId, newCategory, reason) {
  const supabase = await getServerSupabaseClient();
  
  // Get official ID
  const { data: { user } } = await supabase.auth.getUser();
  const officialId = user?.id;

  // Get current category
  const { data: report } = await supabase
    .from("reports")
    .select("category")
    .eq("id", reportId)
    .single();

  const oldCategory = report?.category || "Unknown";

  // Update report category
  const { error: updateError } = await supabase
    .from("reports")
    .update({ category: newCategory })
    .eq("id", reportId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Insert log
  const { error: logError } = await supabase
    .from("reassignment_logs")
    .insert({
      report_id: reportId,
      official_id: officialId,
      old_category: oldCategory,
      new_category: newCategory,
      reason: reason
    });

  if (logError) {
    console.log("Error logging reassignment:", logError);
    // Even if log fails, the assignment succeeded. We can still return success but maybe log it.
  }

  revalidatePath("/");
  return { success: true };
}
