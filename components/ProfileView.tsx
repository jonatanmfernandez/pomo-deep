
import React, { useState } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { Camera, Mail, LogOut, Shield, User as UserIcon, Check, X, Globe, Loader2 } from 'lucide-react';
import { auth, signInWithGoogle, logout } from '../firebase';
import { cn } from '../utils';

interface ProfileViewProps {
  user: User | null;
  language: 'en' | 'es';
  onClose: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, language, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const t = {
    es: {
      title: 'Mi Perfil',
      account: 'Cuenta',
      name: 'Nombre',
      email: 'Correo Electrónico',
      authMethod: 'Método de Autenticación',
      googleLinked: 'Vinculado con Google',
      notLoggedIn: 'No has iniciado sesión',
      loginGoogle: 'Iniciar Sesión con Google',
      logout: 'Cerrar Sesión',
      save: 'Guardar Cambios',
      cancel: 'Cancelar',
      edit: 'Editar Perfil',
      security: 'Seguridad y Privacidad',
      dataDesc: 'Tus datos están protegidos por Firebase.',
      updateSuccess: 'Perfil actualizado correctamente',
      updateError: 'Error al actualizar el perfil'
    },
    en: {
      title: 'My Profile',
      account: 'Account',
      name: 'Name',
      email: 'Email Address',
      authMethod: 'Authentication Method',
      googleLinked: 'Linked with Google',
      notLoggedIn: 'You are not logged in',
      loginGoogle: 'Sign In with Google',
      logout: 'Log Out',
      save: 'Save Changes',
      cancel: 'Cancel',
      edit: 'Edit Profile',
      security: 'Security & Privacy',
      dataDesc: 'Your data is protected by Firebase.',
      updateSuccess: 'Profile updated successfully',
      updateError: 'Error updating profile'
    }
  }[language];

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      setFeedback(language === 'es' ? 'Sesión iniciada' : 'Logged in');
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: newName
      });
      setFeedback(t.updateSuccess);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setFeedback(t.updateError);
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-bottom-4">
      {feedback && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 font-bold text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              {feedback}
          </div>
      )}

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pomo/10 rounded-2xl flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-pomo" />
            </div>
            <h2 className="text-3xl font-black dark:text-white tracking-tight">{t.title}</h2>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-6 h-6" />
        </button>
      </div>

      {!user ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg mb-6">
                <Shield className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t.notLoggedIn}</h3>
            <p className="text-slate-400 text-sm mb-8 text-center max-w-xs">{t.dataDesc}</p>
            <button 
                onClick={handleLogin}
                className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-2xl font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                {t.loginGoogle}
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Quick Info */}
          <div className="lg:col-span-1 flex flex-col items-center">
            <div className="relative group">
                <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-pomo/20 dark:ring-pomo/10 shadow-2xl">
                    <img 
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`} 
                        alt={user.displayName || 'User'} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <button className="absolute bottom-2 right-2 p-3 bg-pomo text-white rounded-full shadow-lg hover:scale-110 transition-transform active:scale-90">
                    <Camera className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-6 text-center">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{user.displayName || 'Pomo User'}</h3>
                <p className="text-slate-400 font-medium text-sm">{user.email}</p>
            </div>

            <div className="w-full mt-10 space-y-3">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    {t.logout}
                </button>
            </div>
          </div>

          {/* Right Column: Settings */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">{t.account}</h4>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-pomo hover:underline">{t.edit}</button>
                    ) : (
                        <div className="flex gap-4">
                            <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">{t.cancel}</button>
                            <button onClick={handleSave} disabled={isSaving} className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                                {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                                {t.save}
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <UserIcon className="w-3.5 h-3.5" /> {t.name}
                        </label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={newName} 
                                onChange={(e) => setNewName(e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-pomo dark:text-white"
                            />
                        ) : (
                            <p className="text-sm font-bold text-slate-900 dark:text-white bg-white/50 dark:bg-slate-900/50 px-4 py-3 rounded-xl border border-transparent">
                                {user.displayName || 'Pomo User'}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> {t.email}
                        </label>
                        <p className="text-sm font-bold text-slate-400 bg-white/50 dark:bg-slate-900/50 px-4 py-3 rounded-xl border border-transparent cursor-not-allowed">
                            {user.email}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" /> {t.authMethod}
                        </label>
                        <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 px-4 py-3 rounded-xl border border-transparent">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.googleLinked}</span>
                            <Check className="w-4 h-4 text-emerald-500 ml-auto" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">{t.security}</h4>
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">PomoDeep Security</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.dataDesc}</p>
                    </div>
                </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
