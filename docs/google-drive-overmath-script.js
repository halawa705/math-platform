/**
 * ============================================================================
 * جسر الربط المباشر والمجاني مدى الحياة مع Google Drive لحساب: overmath.math@gmail.com
 * ============================================================================
 * طريقة التفعيل في دقيقة واحدة (بدون تعقيد Google Cloud أو انتهاء صلاحية التوكن):
 * 1. افتح الرابط: https://script.google.com وأنت مسجل الدخول بحساب: overmath.math@gmail.com
 * 2. اضغط "New project" (مشروع جديد)، وامسح أي كود موجود والصق هذا الكود بالكامل.
 * 3. اضغط زر "Deploy" (نشر) في الأعلى -> اختر "New deployment" (نشر جديد).
 * 4. اختر النوع (Select type): "Web app" (تطبيق ويب).
 * 5. في خانة Execute as اختر: "Me (overmath.math@gmail.com)".
 * 6. في خانة Who has access اختر: "Anyone" (أي شخص لديه الرابط).
 * 7. اضغط Deploy ووافق على الصلاحية (Authorize access -> Advanced -> Go to project).
 * 8. انسخ رابط الـ Web App URL الذي سينتهي بـ `/exec` وضعه في Vercel تحت اسم:
 *    NEXT_PUBLIC_OVERMATH_DRIVE_WEBHOOK_URL
 * ============================================================================
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var rootFolderName = "منصة الرياضيات - OverMath";
    var gradeFolderName = payload.gradeAr || "جميع الصفوف";
    var branchFolderName = payload.branchAr || "الرياضيات";
    var kindFolderName =
      payload.docKind === "final_review"
        ? "المراجعات النهائية"
        : payload.docKind === "exam"
        ? "الاختبارات الرسمية"
        : "المذكرات الدراسية";

    var rootFolder = getOrCreateFolder_(DriveApp.getRootFolder(), rootFolderName);
    var gradeFolder = getOrCreateFolder_(rootFolder, gradeFolderName);
    var branchFolder = getOrCreateFolder_(gradeFolder, branchFolderName);
    var targetFolder = getOrCreateFolder_(branchFolder, kindFolderName);

    var fileName = (payload.titleAr || "مذكرة رياضيات") + ".html";
    var htmlBody = payload.htmlContent || "<html><body><h1>" + payload.titleAr + "</h1></body></html>";

    var file = targetFolder.createFile(fileName, htmlBody, MimeType.HTML);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var responseData = {
      ok: true,
      fileId: file.getId(),
      driveViewUrl: file.getUrl(),
      driveDownloadUrl: "https://drive.google.com/uc?export=download&id=" + file.getId(),
      folderPathAr: rootFolderName + " / " + gradeFolderName + " / " + branchFolderName + " / " + kindFolderName
    };

    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFolder_(parent, name) {
  var iter = parent.getFoldersByName(name);
  if (iter.hasNext()) {
    return iter.next();
  }
  return parent.createFolder(name);
}
