import React, { useState } from 'react';
import { login, register } from '../services/authService';
import { User } from '../types';
import { Lock, Smartphone, Loader2, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

interface LoginOverlayProps {
    onLoginSuccess: (user: User) => void;
    onCancel?: () => void;
}

export const LoginOverlay: React.FC<LoginOverlayProps> = ({ onLoginSuccess, onCancel }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');
        
        if (!phone || phone.length < 11) {
            setError('请输入有效的11位手机号');
            return;
        }
        if (!password || password.length < 6) {
            setError('密码长度至少需6位');
            return;
        }

        if (isRegistering) {
            if (password !== confirmPassword) {
                setError('两次输入的密码不一致');
                return;
            }
        }

        setLoading(true);
        try {
            let user;
            if (isRegistering) {
                user = await register(phone, password);
            } else {
                user = await login(phone, password);
            }
            onLoginSuccess(user);
        } catch (e: any) {
            setError(e.message || '操作失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-[#0a1120]/95 border border-tech-blue/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-tech-blue/20 blur-[50px] rounded-full"></div>
                
                <div className="relative z-10">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-tech-blue/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-tech-blue/20">
                            {isRegistering ? <UserPlus className="text-tech-blue" /> : <LogIn className="text-tech-blue" />}
                        </div>
                        <h3 className="text-xl font-bold text-white">
                            {isRegistering ? '注册账号' : '登录玄机阁'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            {isRegistering ? '创建一个新账号以开启命理之旅' : '欢迎回来，查看您的历史命盘'}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Phone Input */}
                        <div className="bg-slate-900/50 border border-glass-border rounded-xl p-3 flex items-center gap-3 focus-within:border-tech-blue/50 transition-colors">
                            <Smartphone className="text-slate-500 w-5 h-5" />
                            <input 
                                type="tel" 
                                className="bg-transparent outline-none flex-1 text-white placeholder:text-slate-600"
                                placeholder="请输入手机号"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="bg-slate-900/50 border border-glass-border rounded-xl p-3 flex items-center gap-3 focus-within:border-tech-blue/50 transition-colors">
                            <Lock className="text-slate-500 w-5 h-5" />
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="bg-transparent outline-none flex-1 text-white placeholder:text-slate-600"
                                placeholder="请输入密码"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-white">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Confirm Password (Register Only) */}
                        {isRegistering && (
                            <div className="bg-slate-900/50 border border-glass-border rounded-xl p-3 flex items-center gap-3 focus-within:border-tech-blue/50 transition-colors animate-slide-up">
                                <Lock className="text-slate-500 w-5 h-5" />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    className="bg-transparent outline-none flex-1 text-white placeholder:text-slate-600"
                                    placeholder="再次确认密码"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        )}

                        {error && <p className="text-rose-400 text-xs text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}

                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-tech-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : (isRegistering ? '立即注册' : '登 录')}
                        </button>

                        <div className="flex justify-center mt-4">
                            <button 
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setError('');
                                    setPassword('');
                                    setConfirmPassword('');
                                }}
                                className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                            >
                                {isRegistering ? '已有账号？去登录' : '还没有账号？去注册'}
                            </button>
                        </div>
                    </div>
                    
                    {onCancel && (
                        <button onClick={onCancel} className="absolute top-0 right-0 p-4 text-slate-500 hover:text-white transition-colors">
                            ✕
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};