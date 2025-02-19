/* -*- mode: C; indent-tabs-mode: t; tab-width: 8; c-basic-offset: 2; -*- */

/*
 * This file is part of Seed, the GObject Introspection<->Javascript bindings.
 *
 * Seed is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.
 * Seed is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with Seed.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright (C) Robert Carr 2009 <carrr@rpi.edu>
 */

#ifndef _SEED_CLOSURE_H_
#define _SEED_CLOSURE_H_

#include "seed-private.h"

typedef struct _SeedClosure
{
  GClosure closure;

  JSObjectRef function;
  JSValueRef user_data;

  GType return_type;
  gchar *description;
} SeedClosure;

typedef struct _SeedNativeClosure
{
  GICallableInfo *info;
  GIArgInfo *arg_info;
  JSValueRef function;

  ffi_closure *closure;
  ffi_cif *cif;
} SeedNativeClosure;

extern JSClassRef seed_native_callback_class;

SeedNativeClosure *seed_make_native_closure (JSContextRef ctx,
					     GICallableInfo * info,
					     GIArgInfo * arg_info,
					     JSValueRef function);
GClosure *seed_closure_new (JSContextRef ctx,
			    JSObjectRef function,
			    JSObjectRef user_data, const gchar * description);

JSObjectRef seed_closure_get_callable (GClosure * c);

JSValueRef
seed_closure_invoke (GClosure * closure, JSValueRef * args, guint argc,
		     JSValueRef * exception);
JSValueRef seed_closure_invoke_with_context (JSContextRef ctx,
					     GClosure * closure,
					     JSValueRef * args, guint argc,
					     JSValueRef * exception);

void
seed_closure_warn_exception (GClosure * c,
			     JSContextRef ctx, JSValueRef exception);



void seed_closures_init ();

#endif
