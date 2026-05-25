create table if not exists public.edge_rate_limits (
  bucket text primary key,
  window_start timestamptz not null,
  count integer not null check (count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.edge_rate_limits enable row level security;

revoke all on table public.edge_rate_limits from anon, authenticated;
grant all on table public.edge_rate_limits to service_role;

create or replace function public.consume_edge_rate_limit(
  p_bucket text,
  p_max_count integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_count integer;
begin
  if p_bucket is null or length(p_bucket) = 0 then
    raise exception 'rate limit bucket is required';
  end if;

  if p_max_count < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit settings';
  end if;

  insert into public.edge_rate_limits as limits (bucket, window_start, count, updated_at)
  values (p_bucket, v_now, 1, v_now)
  on conflict (bucket) do update set
    window_start = case
      when limits.window_start + make_interval(secs => p_window_seconds) <= v_now then v_now
      else limits.window_start
    end,
    count = case
      when limits.window_start + make_interval(secs => p_window_seconds) <= v_now then 1
      else limits.count + 1
    end,
    updated_at = v_now
  returning limits.window_start, limits.count
  into v_window_start, v_count;

  allowed := v_count <= p_max_count;
  remaining := greatest(p_max_count - v_count, 0);
  reset_at := v_window_start + make_interval(secs => p_window_seconds);

  return next;
end;
$$;

revoke all on function public.consume_edge_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_edge_rate_limit(text, integer, integer) to service_role;
