import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-user-topbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './user-topbar.html',
  styleUrl: './user-topbar.css',
})
export class UserTopbar {}
