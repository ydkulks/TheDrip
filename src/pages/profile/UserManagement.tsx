import { PaginationType, Users } from "@/components/types";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useTokenDetails } from "@/components/utils";
import { useEffect, useState } from "react";
import { UserTable } from "./usersTableColumns";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Plus, Trash } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

export const UserManagement = () => {
  const [userData, setUserData] = useState<undefined | Users>();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { token } = useTokenDetails();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const navigate = useNavigate();

  async function fetchAllUsers(token: string | null, params?: PaginationType): Promise<Users> {
    // WARN: Backend URL
    let url = `http://localhost:8080/admin/users?`;

    if (params?.sort) {
      url += `&sort=${params.sort}`;
    }
    if (params?.page !== undefined) {
      url += `&page=${params.page}`;
    }
    if (params?.size !== undefined) {
      url += `&size=${params.size}`;
    }

    // Remove trailing '&' or '?' if any
    url = url.replace(/&$/, '').replace(/\?$/, '');

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Users = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error; // Re-throw the error to be handled by the caller.
    }
  }

  useEffect(() => {
    const requestParams: PaginationType = {
      sort: "id,asc",
    }
    fetchAllUsers(token, requestParams)
      .then((res) => {
        setUserData(res)
        setTotalPages(res.page.totalPages)
        // console.log(res)
      })
  }, [])

  function handleNewUser() {
    navigate("/profile/user_management/create_user")
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 m-2">User Management</h3>
      <ContextMenu>
        <ContextMenuTrigger>
          <UserTable users={userData} />
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem
            onClick={handleNewUser}
            className="gap-2">
            <Plus size={16} />
            <span className=""> Create New User</span>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => {setIsConfirmationOpen(true)}}
            className="gap-2">
            <Trash size={16} />
            Delete User
            <ContextMenuShortcut>⌘⇧D</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setPage(Math.max(0, page - 1))}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i).map((index) => (
            <PaginationItem key={index}>
              <PaginationLink
                href="#"
                isActive={index === page}
                onClick={() => setPage(index)}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete selected products?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {}}> Delete </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

}
