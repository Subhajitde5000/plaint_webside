import argparse
import sys
import uuid
from pathlib import Path

# Add project root to path so we can import 'app'
PROJECT_ROOT = Path(__file__).resolve().parent if "__file__" in globals() else Path.cwd()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.database import SessionLocal
from app.models.admin import AdminUser
from app.utils.security import hash_password

def add_admin(args):
    db = SessionLocal()
    try:
        existing = db.query(AdminUser).filter(AdminUser.email == args.email).first()
        if existing:
            print(f"Error: Admin with email {args.email} already exists.")
            return

        new_admin = AdminUser(
            uuid=str(uuid.uuid4()),
            email=args.email,
            password_hash=hash_password(args.password),
            first_name=args.first_name,
            last_name=args.last_name,
            role=args.role,
            is_active=True
        )
        db.add(new_admin)
        db.commit()
        print(f"Successfully added admin: {args.email}")
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

def reset_password(args):
    db = SessionLocal()
    try:
        admin = db.query(AdminUser).filter(AdminUser.email == args.email).first()
        if not admin:
            print(f"Error: Admin with email {args.email} not found.")
            return

        admin.password_hash = hash_password(args.password)
        db.commit()
        print(f"Successfully updated password for admin: {args.email}")
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="Admin Management CLI")
    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # Add Admin command
    add_parser = subparsers.add_parser("add", help="Add a new admin")
    add_parser.add_argument("--email", required=True, help="Admin email")
    add_parser.add_argument("--password", required=True, help="Admin password")
    add_parser.add_argument("--first-name", required=True, help="First name")
    add_parser.add_argument("--last-name", required=True, help="Last name")
    add_parser.add_argument("--role", default="super_admin", 
                           choices=["super_admin", "operations_manager", "inventory_manager", "customer_support", "marketing", "garden_services", "analyst"],
                           help="Admin role (default: super_admin)")

    # Reset Password command
    reset_parser = subparsers.add_parser("reset", help="Reset admin password")
    reset_parser.add_argument("--email", required=True, help="Admin email")
    reset_parser.add_argument("--password", required=True, help="New password")

    args = parser.parse_args()

    if args.command == "add":
        add_admin(args)
    elif args.command == "reset":
        reset_password(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()



        # python manage_admin.py add --email admin@example.com --password YourSecurePassword123! --first-name John --last-name Doe --role super_admin
        # python manage_admin.py add --email desubhajit@gmail.com --password 12345 --first-name subha --last-name de --role super_admin


        # python manage_admin.py reset --email admin@example.com --password NewSecurePassword456!