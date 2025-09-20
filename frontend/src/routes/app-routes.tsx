import type { JSX } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { FitView } from '../views/fit-view';
import { LandingView } from '../views/landing-view';
import { OnboardingLayout } from './onboarding/onboarding-layout';
import { GenderStep } from './onboarding/steps/gender-step';
import { MeasurementsStep } from './onboarding/steps/measurements-step';
import { PresetStep } from './onboarding/steps/preset-step';
import { SummaryStep } from './onboarding/steps/summary-step';

export function AppRoutes(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LandingView />} />
        <Route path="onboarding" element={<OnboardingLayout />}>
          <Route index element={<Navigate to="gender" replace />} />
          <Route path="gender" element={<GenderStep />} />
          <Route path="preset" element={<PresetStep />} />
          <Route path="measurements" element={<MeasurementsStep />} />
          <Route path="summary" element={<SummaryStep />} />
        </Route>
        <Route path="fit" element={<FitView />} />
        <Route path="*" element={<Navigate to="/onboarding/gender" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
