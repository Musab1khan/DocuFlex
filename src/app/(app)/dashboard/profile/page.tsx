
"use client";

import React, { useState } from 'react';
import { useDms } from '@/context/dms-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { currentUser, updateUser } = useDms();
  const { toast } = useToast();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = () => {
    if (!name || !email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Name and email cannot be empty.',
      });
      return;
    }
    updateUser(currentUser.id, { name, email });
    toast({
      title: 'Profile Updated',
      description: 'Your name and email have been updated.',
    });
  };

  const handleChangePassword = () => {
    if (currentPassword !== currentUser.password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Your current password is not correct.',
      });
      return;
    }
    if (newPassword.length < 6) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'New password must be at least 6 characters long.',
        });
        return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'New passwords do not match.',
      });
      return;
    }
    updateUser(currentUser.id, { password: newPassword });
    toast({
      title: 'Password Changed',
      description: 'Your password has been successfully updated.',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and password.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
           <CardDescription>
            Update your name and email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='w-full space-y-2'>
                     <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleUpdateProfile}>Update Profile</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
           <CardDescription>
            For security, choose a strong, unique password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </CardContent>
         <CardFooter>
            <Button onClick={handleChangePassword}>Change Password</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
