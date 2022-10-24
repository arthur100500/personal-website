from datetime import datetime

current_data = datetime.today().strftime('%Y-%m-%d')

SQLITE_DATABASE_NAME = "guestbook.db"
SQLITE_DATABASE_BACKUP_NAME = "guestbook_backup" + current_data + ".db"
