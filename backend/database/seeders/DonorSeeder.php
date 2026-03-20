<?php

namespace Database\Seeders;

use App\Models\Donor;
use Illuminate\Database\Seeder;

class DonorSeeder extends Seeder
{
    public function run(): void
    {
        if (Donor::exists()) {
            return;
        }

        $donors = [
            ['name' => 'Alice Johnson', 'email' => 'alice@example.com', 'phone' => '555-0101', 'blood_type' => 'A+', 'age' => 28, 'gender' => 'female', 'city' => 'New York', 'weight' => 62.0, 'last_donation_date' => '2024-10-15', 'is_available' => true],
            ['name' => 'Bob Martinez', 'email' => 'bob@example.com', 'phone' => '555-0102', 'blood_type' => 'O-', 'age' => 35, 'gender' => 'male', 'city' => 'Los Angeles', 'weight' => 78.5, 'last_donation_date' => '2024-11-20', 'is_available' => true],
            ['name' => 'Carol Smith', 'email' => 'carol@example.com', 'phone' => '555-0103', 'blood_type' => 'B+', 'age' => 42, 'gender' => 'female', 'city' => 'Chicago', 'weight' => 58.0, 'last_donation_date' => '2024-09-05', 'is_available' => false],
            ['name' => 'David Lee', 'email' => 'david@example.com', 'phone' => '555-0104', 'blood_type' => 'AB+', 'age' => 31, 'gender' => 'male', 'city' => 'Houston', 'weight' => 82.0, 'last_donation_date' => null, 'is_available' => true],
            ['name' => 'Eva Brown', 'email' => 'eva@example.com', 'phone' => '555-0105', 'blood_type' => 'A-', 'age' => 25, 'gender' => 'female', 'city' => 'Phoenix', 'weight' => 55.0, 'last_donation_date' => '2024-12-01', 'is_available' => true],
            ['name' => 'Frank Wilson', 'email' => 'frank@example.com', 'phone' => '555-0106', 'blood_type' => 'O+', 'age' => 50, 'gender' => 'male', 'city' => 'Philadelphia', 'weight' => 90.0, 'last_donation_date' => '2024-08-14', 'is_available' => true],
            ['name' => 'Grace Taylor', 'email' => 'grace@example.com', 'phone' => '555-0107', 'blood_type' => 'B-', 'age' => 33, 'gender' => 'female', 'city' => 'San Antonio', 'weight' => 65.0, 'last_donation_date' => '2024-11-10', 'is_available' => false],
            ['name' => 'Henry Davis', 'email' => 'henry@example.com', 'phone' => '555-0108', 'blood_type' => 'AB-', 'age' => 45, 'gender' => 'male', 'city' => 'San Diego', 'weight' => 75.0, 'last_donation_date' => '2024-07-22', 'is_available' => true],
        ];

        foreach ($donors as $donor) {
            Donor::create($donor);
        }
    }
}
