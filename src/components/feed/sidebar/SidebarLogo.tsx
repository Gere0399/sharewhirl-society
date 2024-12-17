import { Link } from "react-router-dom";

export function SidebarLogo() {
  return (
    <div className="p-2">
      <Link to="/" className="block">
        <img 
          src="/neo-ai-logo.png" 
          alt="Neo AI Studios"
          className="w-10 h-10 mx-auto object-contain"
          style={{ transform: 'scale(1.5)' }}
        />
      </Link>
    </div>
  );
}