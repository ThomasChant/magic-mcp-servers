import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useUser, UserButton, SignInButton } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';

// 客户端认证部分 - 包含完整Clerk功能
export const AuthSectionWithClerk: React.FC = () => {
    const { isSignedIn, user } = useUser();
    const { t } = useTranslation('common');

    return (
        <div className="flex items-center space-x-3">
            {isSignedIn ? (
                <div className="flex items-center space-x-3">
                    <Link
                        to="/profile"
                        className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                    >
                        {t("auth.profile")}
                    </Link>
                    <UserButton 
                        appearance={{
                            elements: {
                                avatarBox: "h-8 w-8"
                            }
                        }}
                    />
                </div>
            ) : (
                <SignInButton mode="modal">
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                        <User className="h-4 w-4" />
                        {t("auth.signIn")}
                    </button>
                </SignInButton>
            )}
        </div>
    );
};

// 移动端认证部分
export const MobileAuthSectionWithClerk: React.FC<{ 
    setMobileMenuOpen: (open: boolean) => void 
}> = ({ setMobileMenuOpen }) => {
    const { isSignedIn, user } = useUser();
    const { t } = useTranslation('common');

    return (
        <div className="px-3 py-2 mb-3">
            {isSignedIn ? (
                <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                        <UserButton 
                            appearance={{
                                elements: {
                                    avatarBox: "h-8 w-8"
                                }
                            }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                        </span>
                    </div>
                    <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                    >
                        {t("auth.profile")}
                    </Link>
                </div>
            ) : (
                <SignInButton mode="modal">
                    <button className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                        <User className="h-4 w-4 mr-2" />
                        {t("auth.signIn")}
                    </button>
                </SignInButton>
            )}
        </div>
    );
};

// SSR版本的认证部分 - 显示未登录状态
export const AuthSectionSSR: React.FC = () => {
    const { t } = useTranslation('common');

    return (
        <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                <User className="h-4 w-4" />
                {t("auth.signIn")}
            </button>
        </div>
    );
};

export const MobileAuthSectionSSR: React.FC = () => {
    const { t } = useTranslation('common');

    return (
        <div className="px-3 py-2 mb-3">
            <button className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                <User className="h-4 w-4 mr-2" />
                {t("auth.signIn")}
            </button>
        </div>
    );
};