import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, PieChart, Wallet } from 'lucide-react';

export default function MainLayout() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            Finance App
                        </h1>
                        <nav className="hidden md:flex items-center gap-1">
                            <Link to="/">
                                <Button
                                    variant={location.pathname === '/' ? 'secondary' : 'ghost'}
                                    className="gap-2"
                                >
                                    <Wallet className="h-4 w-4" />
                                    資產管理
                                </Button>
                            </Link>
                            <Link to="/expenses">
                                <Button
                                    variant={location.pathname === '/expenses' ? 'secondary' : 'ghost'}
                                    className="gap-2"
                                >
                                    <PieChart className="h-4 w-4" />
                                    消費紀錄
                                </Button>
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 hidden sm:inline-block">
                            {user?.username}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleLogout} title="登出">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {/* Mobile Nav */}
                <div className="md:hidden border-t flex justify-around p-2">
                    <Link to="/" className="flex-1">
                        <Button variant={location.pathname === '/' ? 'secondary' : 'ghost'} className="w-full gap-2">
                            <Wallet className="h-4 w-4" />
                            資產
                        </Button>
                    </Link>
                    <Link to="/expenses" className="flex-1">
                        <Button variant={location.pathname === '/expenses' ? 'secondary' : 'ghost'} className="w-full gap-2">
                            <PieChart className="h-4 w-4" />
                            消費
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}
