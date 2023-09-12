import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { DataService } from 'src/app/services/data.service';
import { CreateGroupModalComponent } from 'src/app/shared/components/create-group-modal/create-group-modal.component';

@Component({
  selector: 'app-profile-group',
  templateUrl: './profile-group.component.html',
  styleUrls: ['./profile-group.component.sass']
})
export class ProfileGroupComponent {
  groupName: string = '';
  groupId!: number;
  isEditing: boolean = false;
  editedGroupName: string = '';
  groupMembers: any[] = [];
  groupList: any[] = [];

  faCirclePlus = faCirclePlus;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    public dialog: MatDialog
  ) {
    this.route.params.subscribe(params => {
      const groupId = params['groupId'];
      this.dataService.getGroupById(groupId).subscribe({
        next: (response: any) => {
          this.groupName = response.name;
          this.groupId = response.id;
          this.groupMembers = response.Users;
          this.groupList = response.Lists;
        },
        error: (error) => {
          console.log(error);
        }
      })
    });
  }

  enterEditMode(): void {
    this.isEditing = true;
    this.editedGroupName = this.groupName;
  }

  updateGroupName(newGroupName: string): void {
    this.groupName = newGroupName;
    this.isEditing = false;

    const updatedGroup = {
      name: this.groupName
    }
    this.dataService.updateGroup(this.groupId, updatedGroup).subscribe({
      next: (response: any) => {
        console.log(response);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  addMember() {
    const dialogRef = this.dialog.open(CreateGroupModalComponent, {
      data: {
        formType: 'userIds'
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedGroup = {
          userIds: this.groupMembers.map((m: any) => m.id).concat(result.users.map((u: any) => u.id))
        }

        this.dataService.updateGroup(this.groupId, updatedGroup).subscribe({
          next: (response: any) => {
            console.log(response);
            this.groupMembers = result.users;
          },
          error: (error) => {
            console.log(error);
          }
        });
      }
    })
  }

  deleteMember(member: any) {
    if (this.groupMembers.length > 2) {
      const updatedGroup = {
        userIds: this.groupMembers.filter((m: any) => m.id !== member.id).map((m: any) => m.id)
      }
      this.dataService.updateGroup(this.groupId, updatedGroup).subscribe({
        next: (response: any) => {
          console.log(response);
          this.groupMembers = this.groupMembers.filter((m: any) => m.id !== member.id);
        },
        error: (error) => {
          console.log(error);
        }
      });
    } else {
      window.alert('You need at least 2 members in a group.');
    }
  }

  updateGroupList(event: any) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(CreateGroupModalComponent, {
      data: {
        formType: 'listName'
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedGroup = {
          listName: result.listName
        }

        this.dataService.updateGroup(this.groupId, updatedGroup).subscribe({
          next: (response: any) => {
            this.groupList = response.group.Lists;
          },
          error: (error) => {
            console.log(error);
          }
        });
      }
    })
  }

  replaceSpacesWithUnderscores(event: any) {
    event.target.value = event.target.value.replace(/\s+/g, '_');
  }
}
