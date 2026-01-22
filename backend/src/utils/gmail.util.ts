/**
 * Gmail-specific utility functions for handling email aliasing
 * 
 * Gmail ignores dots (.) in the local part of email addresses and treats
 * gmail.com and googlemail.com as equivalent domains.
 * 
 * Example: user.name@gmail.com = username@gmail.com = user.name@googlemail.com
 */

/**
 * Normalize Gmail address for duplicate detection
 * Gmail ignores dots in the local part and treats gmail.com/googlemail.com as same
 * 
 * @param email - Email address to normalize
 * @returns Normalized email for comparison (NOT for storage!)
 * 
 * @example
 * normalizeGmailForComparison('User.Name@Gmail.com') // returns 'username@gmail.com'
 * normalizeGmailForComparison('user@example.com') // returns 'user@example.com'
 */
export function normalizeGmailForComparison(email: string): string {
  const trimmedEmail = email.trim().toLowerCase();
  const [localPart, domain] = trimmedEmail.split('@');

  if (!domain) return trimmedEmail;

  // Check if it's a Gmail address
  const isGmail = domain === 'gmail.com' || domain === 'googlemail.com';

  if (isGmail) {
    // Remove dots from local part for Gmail
    const normalizedLocal = localPart.replace(/\./g, '');
    // Always use gmail.com (not googlemail.com)
    return `${normalizedLocal}@gmail.com`;
  }

  return trimmedEmail;
}

/**
 * Check if two emails are equivalent (considering Gmail's dot-ignoring behavior)
 * 
 * @param email1 - First email address
 * @param email2 - Second email address
 * @returns true if emails are equivalent
 * 
 * @example
 * areEmailsEquivalent('user.name@gmail.com', 'username@gmail.com') // returns true
 * areEmailsEquivalent('user.name@outlook.com', 'username@outlook.com') // returns false
 */
export function areEmailsEquivalent(email1: string, email2: string): boolean {
  const normalized1 = normalizeGmailForComparison(email1);
  const normalized2 = normalizeGmailForComparison(email2);
  return normalized1 === normalized2;
}

/**
 * Find user by email, considering Gmail aliasing
 * Use this for login/authentication to allow both dotted and undotted versions
 * 
 * @param email - Email to search for
 * @param prisma - Prisma client instance
 * @returns User if found, null otherwise
 * 
 * @example
 * const user = await findUserByEmailWithAliasing('user.name@gmail.com', prisma);
 * // Will find user registered with 'username@gmail.com' or 'user.name@gmail.com'
 */
export async function findUserByEmailWithAliasing(email: string, prisma: any) {
  const trimmedEmail = email.trim();
  const normalizedEmail = normalizeGmailForComparison(trimmedEmail);

  // First try exact match
  let user = await prisma.user.findUnique({
    where: { email: trimmedEmail },
  });

  // If not found and it's Gmail, try normalized version
  if (!user && normalizedEmail !== trimmedEmail.toLowerCase()) {
    user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive',
        },
      },
    });

    // If still not found, try finding any Gmail variant
    if (!user) {
      const [localPart, domain] = trimmedEmail.toLowerCase().split('@');
      if (domain === 'gmail.com' || domain === 'googlemail.com') {
        // Find all Gmail users with similar local part
        const allUsers = await prisma.user.findMany({
          where: {
            email: {
              endsWith: '@gmail.com',
            },
          },
        });

        // Check if any match when normalized
        user = allUsers.find((u: any) => 
          normalizeGmailForComparison(u.email) === normalizedEmail
        ) || null;
      }
    }
  }

  return user;
}
