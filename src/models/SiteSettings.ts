import mongoose, { Schema } from 'mongoose';

const siteSettingsSchema = new Schema(
  {
    key: { type: String, unique: true, default: 'main' },
    siteName: { type: String, default: 'ТӨГС ЦЭНГЭГ УС ХХК' },
    logo: { type: String, default: '/logo2.png' },
    homeBadge: { type: String, default: '' },
    homeTitle: { type: String, default: '' },
    homeSubtitle: { type: String, default: '' },
    phoneNumbers: { type: [String], default: [] },
    facebookUrl: { type: String, default: '' },
    orderEmail: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
