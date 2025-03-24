from pydantic import BaseModel, EmailStr

# Shared properties
class UserBase(BaseModel):
    email: EmailStr

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: str | None = None
    is_active: bool | None = None
    is_superuser: bool | None = None

# Properties stored in DB
class UserInDBBase(UserBase):
    id: int
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True # Replaces orm_mode in Pydantic v2

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str

# Additional properties to return via API
class User(UserInDBBase):
    pass # For now, return the same as UserInDBBase 