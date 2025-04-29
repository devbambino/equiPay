import { FC } from "react";
import Footer from "./Footer";
import Header from "./Header";
import BottomTabBar from "./ui/BottomTabBar";

interface Props {
    children: React.ReactNode;
}
const Layout: FC<Props> = ({ children }) => {
    return (
        <>
            <div className="bg-gypsum overflow-hidden flex flex-col min-h-screen">
                <Header />
                {children}
                <Footer />
                {/* Mobile Bottom Tab Bar */}
                <BottomTabBar />
            </div>
        </>
    );
};

export default Layout;
