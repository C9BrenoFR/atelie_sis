<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('users', [
            'users' => User::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:1000',
            'is_admin' => 'required|boolean',
            'salary' => 'required|numeric|min:0',
        ]);

        $password = Str::random(12);

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'is_admin' => $data['is_admin'],
            'salary' => $data['salary'],
            'password' => Hash::make($password),
        ]);

        return back()->with('createdUser', [
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $password,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:1000',
            'is_admin' => 'required|boolean',
            'salary' => 'required|numeric|min:0',
        ]);

        $user->update($data);

        return back();
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return to_route('users.index');
    }
}
