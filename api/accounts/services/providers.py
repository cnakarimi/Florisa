from abc import ABC, abstractmethod


class OTPProvider(ABC):
    @abstractmethod
    def send(self, phone: str, code: str) -> None:
        raise NotImplementedError


class ConsoleOTPProvider(OTPProvider):
    def send(self, phone: str, code: str) -> None:
        print(f"OTP for {phone}: {code}", flush=True)
