#!/usr/bin/env seed
// Returns: 0
// STDIN:
// STDOUT:In klass init\nIn constructor for \[object HelloWindow\]\nPrototypes!\nIn map, verifying widget\.title : Hello!
// STDERR:

Gtk = imports.gi.Gtk;
Gtk.init(Seed.argv);

HelloWindowType = {
    parent: Gtk.Window.type,
    name: "HelloWindow",
    class_init: function(klass, prototype)
    {
        prototype.message = "Prototypes!";
        print("In klass init");
    },
    init: function(klass)
    {
        this.title = "Hello!";
        print("In constructor for " + this);
    }};

HelloWindow = new GType(HelloWindowType);
w = new HelloWindow();
print(w.message);
w.signal.map.connect(
             function(widget)
             {
                 print("In map, verifying widget.title : " + widget.title);
             });
w.show();

