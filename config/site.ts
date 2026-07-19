export const siteConfig = {
  name: "Saxmundham Rail Disturbances Report",
  shortName: "Rail Disturbances Report",
  description:
    "Residents can record when railway noise affects everyday life. Non-personal information from approved reports is published to help Saxmundham residents see recurring patterns.",
  communityStatement:
    "This is a community-led project. It is not run by the council or Network Rail.",
  emergency:
    "This is not an emergency service. If there is immediate danger, call 999.",
  privacyContact: process.env.PRIVACY_CONTACT_EMAIL || "",
  dataController: process.env.DATA_CONTROLLER_NAME || "",
  contactRetentionDays: Number(process.env.CONTACT_RETENTION_DAYS || 365),
  publicStatus:
    "Reports are submitted by residents and may not have been independently verified.",
  publicUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://saxmundham-rail-watch.netlify.app",
  locations: [
    "Town centre and station",
    "North of the station",
    "South of the station",
    "East of the railway",
    "West of the railway",
    "Outlying Saxmundham area",
    "Unsure",
  ],
} as const;

export const developmentWarning =
  !siteConfig.privacyContact || !siteConfig.dataController
    ? "Owner action needed before launch: add the data controller name and privacy contact."
    : "";
