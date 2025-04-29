import { HomeIcon, QrCodeIcon, CreditCardIcon, Cog6ToothIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/sell", label: "Sell", icon: QrCodeIcon },
  { href: "/pay", label: "Pay", icon: CreditCardIcon },
  { href: "/manage", label: "Manage", icon: Cog6ToothIcon },
];

export default function BottomTabBar() {
  const router = useRouter();
  // Only show on mobile
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 flex justify-around items-center py-2 sm:hidden">
      {tabs.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center text-xs text-gray-400 hover:text-yellow-400 transition-colors"
        >
          <Icon className="h-7 w-7 mb-1" />
          <span className="font-medium">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
