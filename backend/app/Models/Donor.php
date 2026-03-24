<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donor extends Model
{
    use HasFactory;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'blood_type',
        'age',
        'gender',
        'city',
        'address',
        'weight',
        'last_donation_date',
        'is_available',
        'notes',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'last_donation_date' => 'date',
        'age' => 'integer',
        'weight' => 'float',
    ];
}
