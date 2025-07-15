import {
  Button,
  CurrencyInput,
  Drawer,
  Input,
  Label,
  Text,
} from "@medusajs/ui";
import { useState } from "react";
import { AdminCreateEmployee, QueryCompany } from "../../../../../types";
import { CoolSwitch } from "../../../../components/common";
import { currencySymbolMap } from "../../../../utils";
import { useAdminListCustomers } from '../../../../hooks/api';
import { AdminCustomer } from '@medusajs/types';

export function EmployeesCreateForm({
  handleSubmit,
  loading,
  error,
  company,
  recommendedCustomer,
  onSelectCustomer,
}: {
  handleSubmit: (data: AdminCreateEmployee & { email?: string; first_name?: string; last_name?: string; phone?: string }) => Promise<void>;
  loading: boolean;
  error: Error | null;
  company: QueryCompany;
  recommendedCustomer?: AdminCustomer | null;
  onSelectCustomer?: (customer: AdminCustomer | null) => void;
}) {
  const [formData, setFormData] = useState<
    Omit<AdminCreateEmployee, 'spending_limit'> & {
      spending_limit: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
    }
  >({
    company_id: company.id,
    is_admin: false,
    spending_limit: '0',
    customer_id: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const { data: customers = [], isLoading: searching } = useAdminListCustomers(
    search ? { q: search } : undefined
  ) as { data: AdminCustomer[]; isLoading: boolean };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleCustomerSelect = (customer: AdminCustomer | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      setFormData({
        ...formData,
        customer_id: customer.id,
        email: customer.email || '',
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        phone: customer.phone || '',
      });
    } else {
      setFormData({
        ...formData,
        customer_id: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
      });
    }
    onSelectCustomer?.(customer);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const spendingLimit = formData.spending_limit
      ? parseInt(formData.spending_limit)
      : 0;
    const data = {
      ...formData,
      spending_limit: spendingLimit,
    };
    handleSubmit(data);
  };

  return (
    <form onSubmit={onSubmit}>
      <Drawer.Body className="flex flex-col p-4 gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="h2-core">Customer</h2>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Search Existing Customer
            </Label>
            <Input
              type="text"
              name="customer_search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email or name"
              autoComplete="off"
              className="bg-muted text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary/50"
            />
            {search && customers.length > 0 && !selectedCustomer && (
              <div className="border border-border rounded-lg bg-muted max-h-40 overflow-y-auto mt-1 shadow-lg">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`p-3 cursor-pointer hover:bg-accent transition-colors flex items-center gap-2 ${selectedCustomer?.id === customer.id ? 'bg-accent/70' : ''}`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <span className="font-medium text-foreground">{customer.email}</span>
                    {(customer.first_name || customer.last_name) && (
                      <span className="ml-2 text-muted-foreground">{customer.first_name} {customer.last_name}</span>
                    )}
                  </div>
                ))}
                <div
                  className="p-3 cursor-pointer hover:bg-accent text-primary font-medium rounded-b-lg transition-colors"
                  onClick={() => handleCustomerSelect(null)}
                >
                  + Create new customer
                </div>
              </div>
            )}
          </div>
        </div>
        {selectedCustomer && (
          <div className="flex flex-col gap-2 bg-accent/40 border border-border rounded-lg p-3 mt-2">
            <Text className="text-foreground">Selected: <span className="font-medium">{selectedCustomer.email}</span> {selectedCustomer.first_name} {selectedCustomer.last_name}</Text>
            <Button type="button" variant="secondary" size="small" onClick={() => handleCustomerSelect(null)} className="self-start mt-1">
              Clear
            </Button>
          </div>
        )}
        {!selectedCustomer && (
          <div className="flex flex-col gap-3">
            <h2 className="h2-core">Details</h2>
            <div className="flex flex-col gap-2">
              <Label size="xsmall" className="txt-compact-small font-medium">
                First Name
              </Label>
              <Input
                type="text"
                name="first_name"
                value={formData.first_name || ''}
                onChange={handleChange}
                placeholder="John"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label size="xsmall" className="txt-compact-small font-medium">
                Last Name
              </Label>
              <Input
                type="text"
                name="last_name"
                value={formData.last_name || ''}
                onChange={handleChange}
                placeholder="Doe"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label size="xsmall" className="txt-compact-small font-medium">
                Email
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label size="xsmall" className="txt-compact-small font-medium">
                Phone
              </Label>
              <Input
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="0612345678"
              />
            </div>
          </div>
        )}
        {recommendedCustomer && (
          <div className="flex flex-col gap-2 bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
            <Text className="text-yellow-700">A customer with this email already exists:</Text>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{recommendedCustomer.email}</span>
              <span>{recommendedCustomer.first_name} {recommendedCustomer.last_name}</span>
              <Button type="button" variant="secondary" size="small" onClick={() => handleCustomerSelect(recommendedCustomer)}>
                Add as Employee
              </Button>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <h2 className="h2-core">Permissions</h2>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Spending Limit ({company.currency_code?.toUpperCase() || 'USD'})
            </Label>
            <CurrencyInput
              symbol={currencySymbolMap[company.currency_code || 'USD']}
              code={company.currency_code || 'USD'}
              type="text"
              name="spending_limit"
              value={formData.spending_limit ? formData.spending_limit : ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  spending_limit: e.target.value.replace(/[^0-9]/g, ''),
                })
              }
              placeholder="1000"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label size="xsmall" className="txt-compact-small font-medium">
              Admin Access
            </Label>
            <CoolSwitch
              fieldName="is_admin"
              label="Is Admin"
              description="Enable to grant admin access"
              checked={formData.is_admin || false}
              onChange={(checked) =>
                setFormData({ ...formData, is_admin: checked })
              }
              tooltip="Admins can manage the company's details and employee permissions."
            />
          </div>
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <Drawer.Close asChild>
          <Button variant="secondary">Cancel</Button>
        </Drawer.Close>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
        {error && <Text className="text-red-500">{error.message}</Text>}
      </Drawer.Footer>
    </form>
  );
}
