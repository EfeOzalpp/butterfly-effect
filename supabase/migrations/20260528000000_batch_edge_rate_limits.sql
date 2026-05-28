create or replace function public.consume_edge_rate_limits(p_rules jsonb)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz,
  bucket text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rule jsonb;
  v_bucket text;
  v_max_count integer;
  v_window_seconds integer;
  v_allowed boolean;
  v_remaining integer;
  v_reset_at timestamptz;
begin
  if p_rules is null or jsonb_typeof(p_rules) <> 'array' then
    raise exception 'rate limit rules must be an array';
  end if;

  if jsonb_array_length(p_rules) = 0 then
    allowed := true;
    remaining := null;
    reset_at := null;
    bucket := null;
    return next;
    return;
  end if;

  for v_rule in select value from jsonb_array_elements(p_rules)
  loop
    if jsonb_typeof(v_rule) <> 'object' then
      raise exception 'rate limit rule must be an object';
    end if;

    v_bucket := v_rule ->> 'bucket';
    v_max_count := (v_rule ->> 'max_count')::integer;
    v_window_seconds := (v_rule ->> 'window_seconds')::integer;

    if v_bucket is null or length(v_bucket) = 0 or v_max_count is null or v_window_seconds is null then
      raise exception 'invalid rate limit rule';
    end if;

    select limit_result.allowed, limit_result.remaining, limit_result.reset_at
    into v_allowed, v_remaining, v_reset_at
    from public.consume_edge_rate_limit(v_bucket, v_max_count, v_window_seconds) as limit_result;

    if not v_allowed then
      allowed := false;
      remaining := v_remaining;
      reset_at := v_reset_at;
      bucket := v_bucket;
      return next;
      return;
    end if;
  end loop;

  allowed := true;
  remaining := null;
  reset_at := null;
  bucket := null;
  return next;
end;
$$;

revoke all on function public.consume_edge_rate_limits(jsonb) from public;
grant execute on function public.consume_edge_rate_limits(jsonb) to service_role;
