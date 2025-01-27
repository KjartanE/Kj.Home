import { Card } from "@nextui-org/react";
import React from "react";

interface IMenuButtonProps {
  children: React.ReactNode;
  open?: boolean;
  onClick?: () => void;
}

const MenuCard: React.FC<IMenuButtonProps> = (props) => {
  return (
    <Card className="flex-shrink gap-3 p-6">
      <button className="absolute right-2 top-2 text-gray-500" onClick={props.onClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {props.children}
    </Card>
  );
};

const MenuButton: React.FC<IMenuButtonProps> = (props) => {
  const [isOpen, setIsOpen] = React.useState(props.open || false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative z-40">
      <button className="fixed bottom-0 left-0 h-5 w-full bg-zinc-800 text-white" onClick={toggleMenu}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="mx-auto h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h.01M12 12h.01M18 12h.01" />
        </svg>
      </button>
      <div
        className="duration-900 fixed bottom-0 left-0 z-40 w-full transform shadow-lg transition-transform ease-in-out"
        style={{ transform: isOpen ? "translateY(0)" : "translateY(100%)" }}>
        <MenuCard onClick={toggleMenu}>{props.children}</MenuCard>
      </div>
    </div>
  );
};

export default MenuButton;
