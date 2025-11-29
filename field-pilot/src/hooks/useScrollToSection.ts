import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Hook to automatically scroll to a section based on URL hash or search params
 * Usage: useScrollToSection()
 * 
 * Supports:
 * - URL hash: /profile/edit#notifications
 * - Search params: /profile/edit?section=notifications
 */
export function useScrollToSection() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get section from hash or search params
    const hash = window.location.hash.slice(1);
    const section = searchParams.get('section') || hash;

    if (section) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
          
          // Add a highlight effect
          element.classList.add('highlight-section');
          setTimeout(() => {
            element.classList.remove('highlight-section');
          }, 2000);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);
}

/**
 * Hook to scroll to the first error field in a form
 * Usage: const scrollToError = useScrollToError();
 *        scrollToError(errors);
 */
export function useScrollToError() {
  return (errors: Record<string, string>) => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      // Try to find the input element by name
      const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      
      if (element) {
        // Scroll to the element
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        
        // Focus the element after scrolling
        setTimeout(() => {
          element.focus();
        }, 300);
      } else {
        // If input not found, try to find error message
        const errorElement = document.querySelector(`[data-error-field="${firstErrorField}"]`) as HTMLElement;
        if (errorElement) {
          errorElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
    }
  };
}
