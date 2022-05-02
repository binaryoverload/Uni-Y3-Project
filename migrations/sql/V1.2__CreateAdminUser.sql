INSERT INTO public.users (id, username, password, updated_at, security_stamp, first_name, last_name)
VALUES (DEFAULT, 'admin', '$argon2i$v=19$m=4096,t=3,p=1$WDRHZ0JLbjc5dlJnalN0dw$bdSD4HoiAh6OGuvYZYls+w', DEFAULT,
        DEFAULT, 'Admin', 'User');