Board = new GType({
	parent: Clutter.Group.type,
	name: "Board",
	init: function(klass)
	{
		// Private
		var lights = [], all_lights = [];
		var cl, oldcl = [ ], oldpicked;
		var animating = false;
		var final_score;
		
		function done_animating()
		{
			animating = false;
			
			var x = new Object(), y = new Object();
			window.window.get_pointer(x, y, null);
			
			var picked = stage.get_actor_at_pos(x.value, y.value);
			
			Seed.print(picked);
			
			if(picked)
				picked = picked.get_parent();
			
			if(picked && picked.get_light_x)
			{
				if(picked == oldpicked)
					return false;
			
				oldpicked = picked;
				
				light_lights_from(picked);
			}
			
			return false;
		}
		
		function _connected_lights(li)
		{
			if(!li || li.visited || li.get_closed())
				return [ ];
			
			var x = li.get_light_x();
			var y = li.get_light_y();
			
			li.visited = true;
			
			var con = [li];
			
			while(GLib.main_context_pending())
				GLib.main_context_iteration();
			
			var a = [], b = [], c = [], d = [];
			
			if(lights[x][y+1] && (li.get_state() == lights[x][y+1].get_state()))
				a = _connected_lights(lights[x][y+1]);
			
			if(lights[x][y-1] && (li.get_state() == lights[x][y-1].get_state()))
				b = _connected_lights(lights[x][y-1]);
			
			if(lights[x+1] && lights[x+1][y] && 
			   (li.get_state() == lights[x+1][y].get_state()))
				c = _connected_lights(lights[x+1][y]);
			
			if(lights[x-1] && lights[x-1][y] &&
			   (li.get_state() == lights[x-1][y].get_state()))
				d = _connected_lights(lights[x-1][y]);
			
			return con.concat(a,b,c,d);
		};
		
		function connected_lights(li)
		{
			for(var i in all_lights)
				all_lights[i].visited = false;
			
			if(!li.get_light_x) // We're picking something other than a light!
				return [ li ];
			
			return _connected_lights(li);
		};
		
		function any_connected_lights(li)
		{
			if(!li || li.get_closed())
				return false;
			
			var x = li.get_light_x();
			var y = li.get_light_y();
			
			if(lights[x][y+1] && (li.get_state() == lights[x][y+1].get_state()))
				return !lights[x][y+1].get_closed();

			if(lights[x][y-1] && (li.get_state() == lights[x][y-1].get_state()))
				return !lights[x][y-1].get_closed();
			
			if(lights[x+1] && lights[x+1][y] &&
			   (li.get_state() == lights[x+1][y].get_state()))
				return !lights[x+1][y].get_closed();
			
			if(lights[x-1] && lights[x-1][y] &&
			   (li.get_state() == lights[x-1][y].get_state()))
				return !lights[x-1][y].get_closed();
			
			return false;
		};
		
		function calculate_score(n_lights)
		{
			if (n_lights < 3)
				return 0;

			return (n_lights - 2) * (n_lights - 2);
		};
		
		function light_lights_from(li)
		{
			cl = connected_lights(li);
			
			for(var i in oldcl)
				if(!oldcl[i].get_closed())
					oldcl[i].opacity = 180;
			
			if(cl.length < 2)
				return false;
			
			for(var i in cl)
				cl[i].opacity = 255;
			
			oldcl = cl;
		};
		
		function update_score(tiles)
		{
			var points_awarded = calculate_score(tiles);
			
			if(fly_score)
			{
				var score_text = new Score();
				score_text.animate_score(points_awarded);
			}
			
			score += points_awarded;
			
			Seed.print(score);
			
			if(board.has_completed())
			{
				if(board.has_won())
					score += 1000;
				
				final_score = new Score();
				final_score.animate_final_score(score);
				
				Seed.print("Done with: " + score + " points!");
			}
		};
		
		function enter_tile(actor, event)
		{
			var picked = stage.get_actor_at_pos(event.motion.x,
												event.motion.y).get_parent();
			
			if(picked === oldpicked)
				return false;
			
			oldpicked = picked;
			
			light_lights_from(picked);
			
			return false;
		};
		
		// Public
		this.has_completed = function ()
		{
			for(var i in all_lights)
			{
				li = all_lights[i];
				
				if(!li.get_closed() && any_connected_lights(li))
					return false;
			}
			
			return true;
		};
		
		this.has_won = function ()
		{
			for(var i in all_lights)
			{
				li = all_lights[i];
				
				if(!li.get_closed())
					return false;
			}
			
			return true;
		};
		
		this.get_lights = function ()
		{
			return lights;
		};
		
		this.remove_region = function (actor, event)
		{
			if(animating)
				return false;
				
			if(!cl)
				light_lights_from(actor.get_parent());
			
			if(cl.length < 2)
				return false;
			
			for(var i in cl)
				cl[i].close_tile();
			
			var real_x = 0, timeline = 0;
			
			animating = true;
			
			//timeline = new Clutter.Timeline({duration: 500});
			
			for(var x in lights)
			{
				var good_lights = [];
				var bad_lights = [];
				
				for(var y in lights[x])
				{
					var li = lights[x][y];
					
					if(!li.get_closed())
						good_lights.push(li);
					else
						bad_lights.push(li);
				}
				
				lights[real_x] = good_lights.concat(bad_lights);
				
				var empty_col = true;
				
				for(var y in lights[real_x])
				{
					var li = lights[real_x][y];
					
					li.set_light_x(real_x);
					li.set_light_y(parseInt(y,10));
					
					var new_x = real_x * tile_size + offset;
					var new_y = (tiles_h - y - 1) * tile_size + offset;
					
					if(!li.get_closed() && ((new_x != li.x) ||
												 (new_y != li.y)))
					{
						timeline = li.animate_to(new_x, new_y, timeline);
						
						// This might go away after we can pass timelines around
						var nullize_anim = function (asdf, li)
						{
							li.anim = null;
						}
						
						timeline.signal.completed.connect(nullize_anim, li);
					}
					
					if(!li.get_closed())
						empty_col = false;
					
					GLib.main_context_iteration();
				}
				
				GLib.main_context_iteration();
				
				if(!empty_col)
					real_x++;
			}
			
			//timeline.start();
			
			if(timeline && li.anim)
						// This needs to be changed when we get the ability
						// to pass timelines around.... will fix bugs on
						// slower machines / boards with many tiles
				timeline.signal.completed.connect(done_animating);
			else
				animating = false;
			
			for(;real_x < tiles_w; real_x++)
				lights[real_x] = null;
			
			update_score(cl.length);
			
			cl = oldpicked = null;
			
			return false;
		}
		
		this.new_game = function ()
		{
			var children = this.get_children();
			
			for(var i in children)
				this.remove_actor(children[i]);
			
			if(final_score)
				final_score.hide_score();
			
			all_lights = new Array();
			
			for(var x = 0; x < tiles_w; x++)
			{
				lights[x] = new Array();
				for(var y = 0; y < tiles_h; y++)
				{
					var li = new Light();
				
					li.set_light_x(x);
					li.set_light_y(y);
				
					li.set_position(x * tile_size + offset,
									(tiles_h - y - 1) * tile_size + offset);
					this.add_actor(li);
					li.on.signal.button_press_event.connect(this.remove_region);
				
					lights[x][y] = li;
					all_lights.push(lights[x][y]);
				}
			}
		};
		
		// Implementation
		this.new_game();
		
		this.signal.motion_event.connect(enter_tile);
		this.reactive = true;
	}
});
	
