import { HttpTypes } from "@medusajs/types";
import { Button, Drawer, toast } from "@medusajs/ui";
import { AdminCreateEmployee, QueryCompany } from "../../../../../types";
import { useState } from "react";
import {
  useAdminCreateCustomer,
  useCreateEmployee,
  useAdminListCustomers,
} from "../../../../hooks/api";
import { AdminCustomer } from '@medusajs/types';
import { EmployeesCreateForm } from "./employees-create-form";

export function EmployeeCreateDrawer({ company }: { company: QueryCompany }) {
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [recommendedCustomer, setRecommendedCustomer] = useState<AdminCustomer | null>(null);

  const {
    mutateAsync: createEmployee,
    isPending: createEmployeeLoading,
    error: createEmployeeError,
  } = useCreateEmployee(company.id);

  const {
    mutateAsync: createCustomer,
    isPending: createCustomerLoading,
    error: createCustomerError,
  } = useAdminCreateCustomer();

  const { data: customers = [] } = useAdminListCustomers();

  const handleSubmit = async (
    formData: AdminCreateEmployee & {
      email?: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
    }
  ) => {
    setRecommendedCustomer(null);
    // If an existing customer is selected, just create the employee
    if (formData.customer_id) {
      const employee = await createEmployee({
        spending_limit: formData.spending_limit!,
        is_admin: formData.is_admin!,
        customer_id: formData.customer_id,
      });
      if (!employee) {
        toast.error('Failed to create employee');
        return;
      }
      setOpen(false);
      toast.success('Employee added successfully');
      return;
    }
    // Otherwise, try to create a new customer
    try {
      const { customer } = await createCustomer({
        email: formData.email!,
        first_name: formData.first_name!,
        last_name: formData.last_name!,
        phone: formData.phone!,
        company_name: company.name,
      });
      if (!customer?.id) {
        toast.error('Failed to create customer');
        return;
      }
      const employee = await createEmployee({
        spending_limit: formData.spending_limit!,
        is_admin: formData.is_admin!,
        customer_id: customer.id,
      });
      if (!employee) {
        toast.error('Failed to create employee');
        return;
      }
      setOpen(false);
      toast.success(`Employee ${customer?.first_name} ${customer?.last_name} created successfully`);
    } catch (err: any) {
      // If error is duplicate email, find and suggest the customer
      if (err?.message?.toLowerCase().includes('email')) {
        const found = customers.find(c => c.email === formData.email);
        if (found) {
          setRecommendedCustomer(found);
          toast.error('A customer with this email already exists.');
        } else {
          toast.error('A customer with this email already exists.');
        }
      } else {
        toast.error('Failed to create customer');
      }
    }
  };

  const loading = createCustomerLoading || createEmployeeLoading;
  const error = createCustomerError || createEmployeeError;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="secondary" size="small">
          Add
        </Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Add Company Customer</Drawer.Title>
        </Drawer.Header>
        <EmployeesCreateForm
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          company={company}
          recommendedCustomer={recommendedCustomer}
          onSelectCustomer={customer => setSelectedCustomer(customer)}
        />
      </Drawer.Content>
    </Drawer>
  );
}
