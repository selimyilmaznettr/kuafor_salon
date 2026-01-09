import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";

import { AuthProvider, ProtectedRoute } from "@/context/auth-context";

// Pages
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import CustomerDetails from "@/pages/CustomerDetails";
import Appointments from "@/pages/Appointments";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
            <Route path="/customers" component={() => <ProtectedRoute component={Customers} />} />
            <Route path="/customers/:id" component={() => <ProtectedRoute component={CustomerDetails} />} />
            <Route path="/appointments" component={() => <ProtectedRoute component={Appointments} />} />
            <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
            <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}


export default App;
