import { LoginForm } from "@/components/LoginForm";
import { ContentSlider } from "@/components/ContentSlider";
import { SocialProof } from "@/components/SocialProof";
import "../Login.css"
import logo from "@/assets/logo.png" 

const Index = () => {
  return (
    
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-16">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="mb-12">
              <h1 className="text-2xl font-bold text-foreground"><img src={logo} width={100} /></h1>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Social Proof */}
            <div className="pt-8">
              {/* <SocialProof /> */}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Content Slider */}
      <div className="hidden lg:block lg:w-1/2 p-8">
        <ContentSlider />
      </div>
    </div>
  );
};

export default Index;
