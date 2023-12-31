'use server';
import { signIn } from '@/auth';
import { sql } from '@vercel/postgres';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    required_error: 'Please select a customer.',
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    required_error: 'Please select an invoice status.',
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type FormState = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: FormState, formData: FormData) {
  // Validate formdata using Zod
  const rawFormData = Object.fromEntries(formData.entries());
  const invoiceData = CreateInvoice.safeParse(rawFormData);

  // If form validation fails, return errors early. Otherwise, continue.
  if (!invoiceData.success) {
    return {
      errors: invoiceData.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare Data for insertion into database
  const { customerId, amount, status } = invoiceData.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // throw new Error('Failed to Create Invoice');
  // Insert into database
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.error(error);
    throw error;
    // return { message: 'Database Error: Failed to Create Invoice.' };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: FormState, formData: FormData) {
  // Validate formadata using ZOd
  const invoiceData = UpdateInvoice.safeParse(Object.fromEntries(formData));

  // If form validation fails, return errors early. Otherwise, continue.
  if (!invoiceData.success) {
    return {
      errors: invoiceData.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  // Prepare data for updating the database
  const { customerId, amount, status } = invoiceData.data;
  const amountInCents = amount * 100;

  // throw new Error('Failed to Update Invoice');
  // Update the database
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
      `;
  } catch (error) {
    console.error(error);
    throw error;
    // return { message: 'Database Error: Failed to Update Invoice.' };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    console.error(error);
    throw error;
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}
 
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn( 'credentials', formData);
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