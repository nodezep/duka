-- Update public.has_role and public.has_any_role to support super_admin
-- These functions are split from the 20260507110000_super_admin_role.sql migration
-- to avoid unsafe use of new value of enum type within the same transaction.

-- Update has_role to grant access if the user holds super_admin in any tenant
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _tenant_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        (tenant_id = _tenant_id AND role = _role)
        OR role = 'super_admin'
      )
  )
$$;

-- Update has_any_role to grant access if the user holds super_admin in any tenant
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _tenant_id UUID, _roles app_role[])
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        (tenant_id = _tenant_id AND role = ANY(_roles))
        OR role = 'super_admin'
      )
  )
$$;
