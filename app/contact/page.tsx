// File: app/page.tsx
import { neon } from '@neondatabase/serverless';

export default function Page() {
  async function create(formData: FormData) {
    'use server';
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    const comment = formData.get('comment');
    // Insert the comment from the form into the Postgres database
    await sql('INSERT INTO comments (comment) VALUES ($1)', [comment]);
  }

  return (
    <form action={create}>
      <input type="text" placeholder="write a comment" name="comment" />
      <button type="submit">Submit</button>
    </form>
  );
}


// export default function ContactPage() {
//   return (
//     <div className="min-h-screen bg-page flex items-center justify-center">
//       <div className="text-center px-6">
//         <h1 className="font-lora text-4xl font-semibold text-ink mb-4">Contact</h1>
//         <p className="text-ink-muted max-w-md mx-auto">
//           This page is coming soon! We'll build a contact form here in a future step.
//         </p>
//       </div>
//     </div>
//   )
// }
