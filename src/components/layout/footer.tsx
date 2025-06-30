
import Link from 'next/link'; // Import Link for potential future links
import { cn } from '@/lib/utils'; // Import cn

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t py-6 md:py-8 bg-secondary text-secondary-foreground"> {/* Adjusted background */}
      <div className="container flex flex-col items-center justify-center md:flex-row md:justify-between">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} DigitalZone JC. All rights reserved.
        </p>
        {/* Add social links or other footer content here, applying hover effects */}
         <div className="flex gap-4 mt-4 md:mt-0">
            {/* Example Links - Add real links later */}
            <Link href="#" className={cn("text-sm text-muted-foreground", "link-hover-effect")}>Privacy Policy</Link>
            <Link href="#" className={cn("text-sm text-muted-foreground", "link-hover-effect")}>Terms of Service</Link>
            <Link href="/about" className={cn("text-sm text-muted-foreground", "link-hover-effect")}>About Us</Link>
         </div>
      </div>
    </footer>
  );
}
