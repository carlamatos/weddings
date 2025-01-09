"use server"

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { sql } from '@vercel/postgres';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { User } from './definitions';
import { auth } from '@/auth';
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
      invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
      .number()
      .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
      invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
  });

  const UserSchema = z.object({
    id: z.string(),
    name: z.string({
      invalid_type_error: 'Please specify a name.',
    }),
    email: z.string()
      .email({ message: 'Invalid email address. Please enter a valid email.'}),
   
    password: z.string(),
  });


  const UserPageSchema = z.object({
    id: z.string(),
    event_name: z.string(), 
    description: z.string(), 
    event_date: z.string(),
    location: z.string(),
    slug: z.string({
      invalid_type_error: 'Please specify a name.',
    }),
    email: z.string()
      .email({ message: 'Invalid email address. Please enter a valid email.'}),
   
    
    url: z.string(),
    street_address: z.string(),
    unit_number: z.string(),
    postal_code: z.string(), 
    city: z.string(), 
    country: z.string(),
    
    create_at: z.date(),

    
  });


const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const CreateUserPage = UserPageSchema.omit({ id: true, create_at: true });
const CreateUser = UserSchema.omit({id: true, password:true});
export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
  };


  export type UserPageState = {
    errors?: {
      event_name?: string[];
      event_date?: string[];
      location?: string[];
      email?: string[];
      slug?: string[];
      description?: string[];
      url?: string[];
      
    };
    unit_number?: string | null;
    street_address?: string | null;
    postal_code?: string | null;
    city?: string | null;
    country?: string | null;
  };


  export async function createUserPage(prevState: UserPageState, formData: FormData){

    const session = await auth();
    const validatedFields = CreateUserPage.safeParse({
      event_name: formData.get('eventName'),
      event_date: formData.get('eventDate'),
      location: formData.get('location'),
      email: formData.get('email'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      url: formData.get('slug'),
      street_address: formData.get('streetAddress'),
      unit_number: formData.get('unitNumber'),
      postal_code: formData.get('postalCode'),
      city: formData.get('city'),
      country: formData.get('country'),
  });
  //console.log(formData);
  
  if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Page.',
      };
    }
    
    const { event_name, description, event_date,location,email,slug,url,street_address,unit_number,postal_code, city, country } = validatedFields.data;

    const user_id = session?.user?.id;
  const date = new Date().toISOString().split('T')[0];
  try {
      await sql`
  INSERT INTO user_page (
        heading, main_content, description, event_date, location,
        user_email, slug, url, street_address, unit_number, postal_code, city, country
      ) VALUES (
        ${event_name}, ${description},${description}, ${event_date}, ${location}, ${email}, ${slug}, ${url}, ${street_address}, ${unit_number}, ${postal_code}, ${city}, ${country}
      );
`;
  } catch (error) {
    
    console.error('Database Error:', error); // Log the actual error to the server console

    // Return a user-friendly error message while logging the actual error
    return {
      message: 'Database Error: Failed to Create page.',
      error: error.message || error, // Include the error details in the response for debugging
    };
  }

  revalidatePath(`/${slug}`);
  redirect(`/${slug}`);
  }
   
  export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Create Invoice.',
        };
      }
      const { customerId, amount, status } = validatedFields.data;

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    try {
        await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

}


export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;
    try {
        await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to update Invoice.',
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    
  
    
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Delete Invoice.',
        };
    }
    revalidatePath('/dashboard/invoices');
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


export async function createUser(user: User) {
  
  
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
          message: 'Database Error: Failed to Create Invoice.',
      };
  }

  //revalidatePath('/dashboard/invoices');
  //redirect('/dashboard/invoices');

}