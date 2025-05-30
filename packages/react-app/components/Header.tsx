import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function Header() {
  const [hideConnectBtn, setHideConnectBtn] = useState(false);
  const { connect } = useConnect();

  useEffect(() => {
    if (window.ethereum && window.ethereum.isMiniPay) {
      setHideConnectBtn(true);
      connect({ connector: injected({ target: "metaMask" }) });
    }
  }, []);

  return (
    <Disclosure as="nav" className="bg-gray-900 text-white">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-inset focus:rounded-none focus:ring-black">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center space-x-2">
                  <a href="/"><span className="text-2xl font-bold text-[#0e76fe]">Equi<span className="text-yellow-400">Pay</span></span></a>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <a
                    href="/sell"
                    className="inline-flex items-center hover:border-b-2 px-1 pt-1 text-sm font-medium hover:text-yellow-400 hover:border-yellow-400"
                  >
                    Sell
                  </a>
                  <a
                    href="/pay"
                    className="inline-flex items-center hover:border-b-2 px-1 pt-1 text-sm font-medium hover:text-yellow-400 hover:border-yellow-400"
                  >
                    Pay
                  </a>
                  <a
                    href="/manage"
                    className="inline-flex items-center hover:border-b-2 px-1 pt-1 text-sm font-medium hover:text-yellow-400 hover:border-yellow-400"
                  >
                    Manage
                  </a>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {!hideConnectBtn && (
                  <ConnectButton
                    chainStatus={"none"}
                    accountStatus={"avatar"}
                    label="Connect"
                    showBalance={{
                      smallScreen: false,
                      largeScreen: false,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pt-2 pb-4">
              <Disclosure.Button
                as="a"
                href="/"
                className="block border-l-4 border-black py-2 pl-3 pr-4 text-base font-medium"
              >
                Home
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                href="/sell"
                className="block border-l-4 border-black py-2 pl-3 pr-4 text-base font-medium"
              >
                Sell
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                href="/pay"
                className="block border-l-4 border-black py-2 pl-3 pr-4 text-base font-medium"
              >
                Pay
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                href="/manage"
                className="block border-l-4 border-black py-2 pl-3 pr-4 text-base font-medium"
              >
                Manage
              </Disclosure.Button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
