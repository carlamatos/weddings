"use server"

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

import { signIn } from '@/auth';

import { DBUser } from './definitions';
import { auth } from '@/auth';
import { fetchUserPage } from './data';
import { AuthError } from 'next-auth';
  const UserSchema = z.object({
    id: z.string(),
    name: z.string({
      invalid_type_error: 'Please specify a name.',
    }),
    email: z.string()
      .email({ message: 'Invalid email address. Please enter a valid email.'}),
   
    password: z.string(),
    given_name:  z.string(),
    family_name:  z.string(),
    provider:  z.string(),
    provider_id:  z.string(),
    picture:  z.string(),
  });


  const UserPageSchema = z.object({
    id: z.string(),
    event_name: z.string(),
    description: z.string(),
    event_date: z.string(),
    event_time: z.string().min(1, { message: 'Event time is required.' }),
    event_theme: z.enum(['wedding', 'event'], { invalid_type_error: 'Please select a theme.' }),
    location: z.string(),
    slug: z.string({
      invalid_type_error: 'Please specify a slug (page URL).',
    }),
    email: z.string()
      .email({ message: 'Invalid email address. Please enter a valid email.'}),


    url: z.string(),
    street_address: z.string(),
    unit_number: z.string(),
    postal_code: z.string(),
    city: z.string(),
    country: z.string(),
    place_id: z.string().optional(),
    formatted_address: z.string().optional(),

    create_at: z.date(),


  });


const CreateUserPage = UserPageSchema.omit({ id: true, create_at: true });
const CreateUser = UserSchema.omit({id: true, password:true,  given_name: true, family_name: true, provider: true,provider_id:true,picture: true,});
const CreateExtendedUser = UserSchema.omit({id: true, password:true});
export type UserPageState = {
    errors?: {
      event_name?: string[];
      description?: string[];
      event_date?: string[];
      event_time?: string[];
      event_theme?: string[];
      location?: string[];
      slug?: string[];
      email?: string[];
      url?: string[];
      unit_number?: string[];
      street_address?: string[];
      postal_code?: string[];
      city?: string[];
      country?: string[];
    };
    message?: string | null;
  };


  export async function createUserPage(prevState: UserPageState, formData: FormData){

    const session = await auth();
  
    const formSlug = formData.get('slug');
    //check if the slug already exists
    if (typeof formSlug === 'string' && formSlug.trim() !== '') {
     const userPage = await fetchUserPage(formSlug);

     if (userPage !== undefined){
      return {
        errors: { slug: [`The URL '${formSlug}' is already in use, please use another slug`] },
        message: `The URL '${formSlug}' is already in use, please use another slug`,
      };
     }
    }
    const validatedFields = CreateUserPage.safeParse({
      event_name: formData.get('eventName'),
      event_date: formData.get('eventDate'),
      event_time: formData.get('eventTime'),
      event_theme: formData.get('eventTheme'),
      location: formData.get('location'),
      email: formData.get('email'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      url: (formData.get('url') as string) ?? '',
      street_address: (formData.get('streetAddress') as string) ?? '',
      unit_number: (formData.get('unitNumber') as string) ?? '',
      postal_code: (formData.get('postalCode') as string) ?? '',
      city: (formData.get('city') as string) ?? '',
      country: (formData.get('country') as string) ?? '',
      place_id: formData.get('placeId') as string || undefined,
      formatted_address: formData.get('formattedAddress') as string || undefined,
  });
  //console.log(formData);
  


  if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Page.',
      };
    }
    
    const { event_name, description, event_date, event_time, event_theme, location, email, slug, url, street_address, unit_number, postal_code, city, country, place_id, formatted_address } = validatedFields.data;

    const user_id = session?.user?.id;

  try {
      await sql`
  INSERT INTO user_page (
        user_id, heading, main_content, description, event_date, event_time, event_theme,
        location, user_email, slug, url, street_address, unit_number, postal_code, city, country,
        place_id, formatted_address
      ) VALUES (
        ${user_id}, ${event_name}, ${description}, ${description}, ${event_date}, ${event_time}, ${event_theme},
        ${location}, ${email}, ${slug}, ${url}, ${street_address}, ${unit_number}, ${postal_code}, ${city}, ${country},
        ${place_id ?? null}, ${formatted_address ?? null}
      );
`;
  } catch (error) {
    
    console.error('Database Error:', error); // Log the actual error to the server console

    // Return a user-friendly error message while logging the actual error
    return {
      //errors:  { database: ['Database Error: Failed to Create Page.'] }, // Include the error details in the response for debugging
      message: `Database Error: Failed to Create Invoice. ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  revalidatePath(`/${slug}`);
  redirect(`/${slug}`);
  }
   
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
       
    
  }
}


export async function GoogleSignIn() {
  await signIn("google")
}


export async function createExtendedUser(user: DBUser) {
  
 /* console.log("UserID: " + user.id);
  console.log("UserNAME: " + user.name);
  console.log("UserEMAIL: " + user.email);
  */
  const validatedFields = CreateExtendedUser.safeParse({
      
      name: user.name,
      email: user.email,
      given_name: user.given_name,
      family_name: user.family_name,
      provider: user.provider,
      provider_id: user.provider_id,
      picture: user.picture,
      
  });
  if (!validatedFields.success) {
    
    return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create User.',
      };
      
    }
    const {name, email, given_name, family_name, provider, provider_id, picture } = validatedFields.data;
    const date = new Date().toISOString().split('T')[0];
  try {
      await sql`
  INSERT INTO users (name, email, date, given_name,family_name,provider,provider_id,picture)
  VALUES (${name}, ${email}, ${date}, ${given_name}, ${family_name}, ${provider}, ${provider_id}, ${picture})
`;
    
  } catch (error) {
      
      return {
          message:`Database Error: Failed to Create user. ${error instanceof Error ? error.message : String(error)}`,
      };
  }

  //revalidatePath('/dashboard/invoices');
  //redirect('/dashboard/invoices');

}


export async function createUser(user: DBUser) {
  
  
  const validatedFields = CreateUser.safeParse({
      
      name: user.name,
      email: user.email,
  });
  if (!validatedFields.success) {
    
    return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create User.',
      };
      
    }
    const {name, email } = validatedFields.data;
    const date = new Date().toISOString().split('T')[0];
  try {
      await sql`
  INSERT INTO users (name, email, date)
  VALUES (${name}, ${email}, ${date})
`;

  } catch (error) {
    console.log("error inserting User");
      return {
          message:`Database Error: Failed to Create Invoice. ${error instanceof Error ? error.message : String(error)}`,

      };
  }

  //revalidatePath('/dashboard/invoices');
  //redirect('/dashboard/invoices');

}

const RegisterSchema = z.object({
  given_name: z.string().min(1, { message: 'Please enter your first name.' }),
  family_name: z.string().min(1, { message: 'Please enter your last name.' }),
  phone: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export type RegisterState = {
  errors?: {
    given_name?: string[];
    family_name?: string[];
    phone?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
};

export async function registerUser(prevState: RegisterState, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse({
    given_name: formData.get('given_name'),
    family_name: formData.get('family_name'),
    phone: (formData.get('phone') as string) || undefined,
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fix the errors below.',
    };
  }

  const { given_name, family_name, phone, email, password } = validatedFields.data;

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.rows.length > 0) {
      return {
        errors: { email: ['An account with this email already exists.'] },
        message: 'An account with this email already exists.',
      };
    }
  } catch (error) {
    return { message: `Database Error: ${error instanceof Error ? error.message : String(error)}` };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const name = `${given_name} ${family_name}`;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO users (name, email, password, date, given_name, family_name, provider, provider_id, picture, phone)
      VALUES (${name}, ${email}, ${hashedPassword}, ${date}, ${given_name}, ${family_name}, 'credentials', '', '', ${phone || ''})
    `;
  } catch (error) {
    return {
      message: `Database Error: Failed to create account. ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  redirect('/login');
}