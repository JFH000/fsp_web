-- Add customer_ws1 and customer_ws3 roles, internal notes column, fix RLS update policy

-- 1. Extend role constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('admin', 'customer', 'customer_ws1', 'customer_ws3'));

-- 2. Add internal notes column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Admin can now read all profiles
DROP POLICY IF EXISTS "own_profile_select" ON user_profiles;
DROP POLICY IF EXISTS "users can read own profile" ON user_profiles;
CREATE POLICY "own_profile_select" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR is_admin());

-- 4a. Non-admin: can edit own profile but NOT the role field
DROP POLICY IF EXISTS "own_profile_update" ON user_profiles;
DROP POLICY IF EXISTS "users can update own profile" ON user_profiles;
CREATE POLICY "own_profile_update" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id AND NOT is_admin())
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT up.role FROM user_profiles up WHERE up.id = auth.uid())
  );

-- 4b. Admin: can update any profile including role
DROP POLICY IF EXISTS "admin_profile_update" ON user_profiles;
CREATE POLICY "admin_profile_update" ON user_profiles
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
