
-- Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own roles readable" ON public.user_roles;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT public.has_role(_user_id, 'admin'::public.app_role);
$$;

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'trial', -- trial | active | expired
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  current_period_end timestamptz,
  admin_bypass boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own sub readable" ON public.subscriptions;
CREATE POLICY "own sub readable" ON public.subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Payment submissions
CREATE TABLE IF NOT EXISTS public.payment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_usd numeric NOT NULL DEFAULT 5,
  sender_name text,
  sender_phone text,
  txn_reference text,
  note text,
  status text NOT NULL DEFAULT 'pending', -- pending | verified | rejected
  submitted_at timestamptz NOT NULL DEFAULT now(),
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz
);
GRANT SELECT, INSERT ON public.payment_submissions TO authenticated;
GRANT ALL ON public.payment_submissions TO service_role;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own payments" ON public.payment_submissions;
CREATE POLICY "own payments" ON public.payment_submissions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "insert own payment" ON public.payment_submissions;
CREATE POLICY "insert own payment" ON public.payment_submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Study schedule
CREATE TABLE IF NOT EXISTS public.study_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time_of_day text NOT NULL, -- 'HH:MM'
  duration_minutes int NOT NULL DEFAULT 30,
  notify boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_schedule TO authenticated;
GRANT ALL ON public.study_schedule TO service_role;
ALTER TABLE public.study_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own schedule" ON public.study_schedule;
CREATE POLICY "own schedule" ON public.study_schedule FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Study sessions
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  seconds_spent int NOT NULL DEFAULT 0,
  quiz_score int,
  quiz_total int,
  ended_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.study_sessions TO authenticated;
GRANT ALL ON public.study_sessions TO service_role;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own sessions" ON public.study_sessions;
CREATE POLICY "own sessions" ON public.study_sessions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Research notes
CREATE TABLE IF NOT EXISTS public.research_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  title text NOT NULL,
  content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_notes TO authenticated;
GRANT ALL ON public.research_notes TO service_role;
ALTER TABLE public.research_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own research" ON public.research_notes;
CREATE POLICY "own research" ON public.research_notes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Auto-bootstrap on new user: subscription + admin role for owner email
CREATE OR REPLACE FUNCTION public.handle_new_user_extras()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.subscriptions(user_id, status, trial_ends_at, admin_bypass)
  VALUES (
    NEW.id,
    CASE WHEN lower(NEW.email) = 'josiahchirambo2@gmail.com' THEN 'active' ELSE 'trial' END,
    now() + interval '7 days',
    lower(NEW.email) = 'josiahchirambo2@gmail.com'
  ) ON CONFLICT (user_id) DO NOTHING;

  IF lower(NEW.email) = 'josiahchirambo2@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created_extras ON auth.users;
CREATE TRIGGER on_auth_user_created_extras
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_extras();

-- Backfill any existing users
INSERT INTO public.subscriptions(user_id, status, trial_ends_at, admin_bypass)
SELECT u.id,
  CASE WHEN lower(u.email) = 'josiahchirambo2@gmail.com' THEN 'active' ELSE 'trial' END,
  now() + interval '7 days',
  lower(u.email) = 'josiahchirambo2@gmail.com'
FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_roles(user_id, role)
SELECT id, 'admin' FROM auth.users WHERE lower(email) = 'josiahchirambo2@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Admin verify RPC
CREATE OR REPLACE FUNCTION public.verify_payment(_payment_id uuid, _months int DEFAULT 1)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _uid uuid; _current timestamptz;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'not admin'; END IF;
  UPDATE public.payment_submissions SET status='verified', verified_by=auth.uid(), verified_at=now()
    WHERE id=_payment_id RETURNING user_id INTO _uid;
  IF _uid IS NULL THEN RAISE EXCEPTION 'payment not found'; END IF;
  SELECT COALESCE(GREATEST(current_period_end, now()), now()) INTO _current FROM public.subscriptions WHERE user_id=_uid;
  INSERT INTO public.subscriptions(user_id, status, current_period_end, trial_ends_at)
    VALUES (_uid, 'active', _current + (_months || ' months')::interval, now())
    ON CONFLICT (user_id) DO UPDATE SET status='active', current_period_end=EXCLUDED.current_period_end, updated_at=now();
END; $$;

CREATE OR REPLACE FUNCTION public.reject_payment(_payment_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'not admin'; END IF;
  UPDATE public.payment_submissions SET status='rejected', verified_by=auth.uid(), verified_at=now() WHERE id=_payment_id;
END; $$;

REVOKE ALL ON FUNCTION public.verify_payment(uuid, int) FROM public;
REVOKE ALL ON FUNCTION public.reject_payment(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_payment(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_payment(uuid) TO authenticated;
