if BUILD_DBUS_MODULE

SUBDIRS = util

EXTRA_DIST = dbus2js.py \
			 dbus.js \
			 dbus-values.h \
			 lang.js \
			 dbus-exports.h

moduledir = $(datadir)/seed
module_DATA = dbus.js lang.js

seedlibdir = ${libdir}/seed

seedlib_LTLIBRARIES = \
	libseed_dbusnative.la

libseed_dbusnative_la_SOURCES = \
	module.c \
	util/dbus.c \
	util/dbus-proxy.c \
	util/dbus-signals.c \
	dbus-values.c  \
	dbus-exports.c 


libseed_dbusnative_la_CFLAGS = \
	-Wall \
	-I@top_srcdir@/libseed/ \
	$(GOBJECT_INTROSPECTION_CFLAGS) \
	$(DBUS_CFLAGS) \
	$(SEED_DEBUG_CFLAGS) \
	$(SEED_PROFILE_CFLAGS)


libseed_dbusnative_la_LDFLAGS = \
	-module -avoid-version \
	$(GOBJECT_INTROSPECTION_LDFLAGS) \
	-L/lib \
	-ldbus-1 \
	$(DBUS_LDFLAGS) \
	-ldbus-glib-1 \
	$(SEED_PROFILE_LIBS)


endif



