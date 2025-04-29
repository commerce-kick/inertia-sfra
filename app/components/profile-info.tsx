import type { TProfile } from "@/types/account";

export function ProfileInfo({ firstName, lastName, email, phone }: TProfile) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500">First Name</h3>
        <p>{firstName}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
        <p>{lastName}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Email</h3>
        <p>{email}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Phone</h3>
        <p>{phone}</p>
      </div>
    </div>
  );
}
