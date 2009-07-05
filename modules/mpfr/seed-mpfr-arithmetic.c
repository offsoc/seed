
#include <mpfr.h>
#include "seed-mpfr.h"

/* This is a bit disgusting. Oh well. */
SeedValue seed_mpfr_add (SeedContext ctx,
                         SeedObject function,
                         SeedObject this_object,
                         gsize argument_count,
                         const SeedValue args[],
                         SeedException * exception)
{
    mpfr_rnd_t rnd;
    mpfr_ptr rop, op1, op2;
    gdouble dop1, dop2;
    SeedObject obj;
    gint ret;
    seed_mpfr_t argt1, argt2;
    /* only want 1 double argument. alternatively, could accept 2,
       add those, and set from the result*/

    CHECK_ARG_COUNT("mpfr.add", 3);

    rop = seed_object_get_private(this_object);
    rnd = seed_value_to_mpfr_rnd_t(ctx, args[2], exception);

    argt1 = seed_mpfr_arg_type(ctx, args[0], exception);
    argt2 = seed_mpfr_arg_type(ctx, args[1], exception);

    if ( (argt1 & argt2) == SEED_MPFR_MPFR )
    {
        /* both mpfr_t */
        op1 = seed_object_get_private(args[0]);
        op2 = seed_object_get_private(args[1]);
        ret = mpfr_add(rop, op1, op2, rnd);
    }
    else if ( (argt1 | argt2) == (SEED_MPFR_MPFR | SEED_MPFR_DOUBLE) )
    {
        /* a double and an mpfr_t. Figure out the order */
        if ( argt1 == SEED_MPFR_MPFR )
        {
            op1 = seed_object_get_private(args[0]);
            dop2 = seed_value_to_double(ctx, args[1], exception);
            mpfr_add_d(rop, op1, dop2, rnd);
        }
        else
        {
            dop2 = seed_value_to_double(ctx, args[0], exception);
            op1 = seed_object_get_private(args[1]);
            mpfr_add_d(rop, op1, dop2, rnd);
        }
    }
    else if ( (argt1 & argt2) == SEED_MPFR_DOUBLE )
    {
        /* 2 doubles. hopefully doesn't happen */
        dop1 = seed_value_to_double(ctx, args[0], exception);
        dop2 = seed_value_to_double(ctx, args[1], exception);
        ret = mpfr_set_d(rop, dop1 + dop2, rnd);
    }
    else
    {
        TYPE_EXCEPTION("mpfr.add", "double or mpfr_t");
    }

    return seed_value_from_int(ctx, ret, exception);
}

SeedValue seed_mpfr_sqrt (SeedContext ctx,
                          SeedObject function,
                          SeedObject this_object,
                          gsize argument_count,
                          const SeedValue args[],
                          SeedException * exception)
{
    mpfr_rnd_t rnd;
    mpfr_ptr rop, op;
    gint ret;

    CHECK_ARG_COUNT("mpfr.sqrt", 2);

    rop = seed_object_get_private(this_object);
    rnd = seed_value_to_mpfr_rnd_t(ctx, args[1], exception);

    if ( seed_value_is_object_of_class(ctx, args[0], mpfr_class) )
    {
        op = seed_object_get_private(args[0]);
    }
    else
    {
        TYPE_EXCEPTION("mpfr.sqrt", "mpfr_t");
    }

    ret = mpfr_sqrt(rop, op, rnd);

    return seed_value_from_int(ctx, ret, exception);
}

