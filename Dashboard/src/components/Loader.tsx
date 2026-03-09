import React from "react";

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black/40">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
      {text && <p className="mt-4 text-white font-medium">{text}</p>}
    </div>
  );
};

export default Loader;
