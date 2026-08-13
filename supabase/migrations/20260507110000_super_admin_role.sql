-- Add super_admin role for the S360T internal team
-- This role bypasses all tenant-level RLS checks and has unrestricted access

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

