'use client';

export function HeaderDivider() {
  return (
    <svg
      aria-hidden="true"
      width="100%"
      height="8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="header-divider"
      viewBox="0 0 1000 8"
      preserveAspectRatio="none"
    >
      <pattern id="wave-pattern" x="0" y="0" width="91" height="8" patternUnits="userSpaceOnUse">
        <g clipPath="url(#clip0_wave)">
          <path
            d="M114 4c-5.067 4.667-10.133 4.667-15.2 0S88.667-.667 83.6 4 73.467 8.667 68.4 4 58.267-.667 53.2 4 43.067 8.667 38 4 27.867-.667 22.8 4 12.667 8.667 7.6 4-2.533-.667-7.6 4s-10.133 4.667-15.2 0S-32.933-.667-38 4s-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133-4.667-15.2 0-10.133 4.667-15.2 0-10.133 4.667-15.2 0-10.133 4.667-15.2 0-10.133 4.667-15.2 0-10.133 4.667-15.2 0-10.133 4.667-15.2 0"
            stroke="currentColor"
            strokeLinecap="square"
            strokeWidth="1"
          />
        </g>
        <defs>
          <clipPath id="clip0_wave">
            <rect width="100%" height="8" fill="white" />
          </clipPath>
        </defs>
      </pattern>
      <rect width="100%" height="100%" fill="url(#wave-pattern)" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar App</h1>
      </div>
      <HeaderDivider />
    </header>
  );
}
