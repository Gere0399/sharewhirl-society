import { Link } from "react-router-dom";

export function SidebarLogo() {
  return (
    <div className="p-2">
      <Link to="/" className="block">
        <img 
          src="/neo-ai-logo.png" 
          alt="Neo AI Studios"
          className="w-12 h-12 mx-auto object-contain"
        />
      </Link>
    </div>
  );
}