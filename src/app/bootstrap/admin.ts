import config from '../config';
import { User } from '../modules/user/user.model';

export const ensureAdminUser = async () => {
  const email = config.admin.email?.trim().toLowerCase();
  const password = config.admin.password?.trim();
  const name = (config.admin.name || 'Administrator').trim();

  if (!email || !password) {
    return;
  }

  const existing = await User.findOne({ email }).select('+password +superPassword');
  if (!existing) {
    await User.create({ 
      email, 
      password, 
      name, 
      role: 'admin', 
      isActive: true,
      superPassword: config.setup.super_password
    });
    return;
  }

  let changed = false;
  if (existing.role !== 'admin') {
    existing.role = 'admin';
    changed = true;
  }

  if (!existing.password && password) {
    existing.password = password;
    changed = true;
  }

  if (!existing.superPassword) {
    existing.superPassword = config.setup.super_password;
    changed = true;
  }

  if (changed) {
    await existing.save();
  }
};
